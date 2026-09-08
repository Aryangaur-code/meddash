"use client";

/**
 * CTTumor3DViewer
 * ----------------
 * Drop-in component for the Doctor Portal (/doctor). Lets a physician upload
 * a CT volume (NIfTI), runs it through the V-Net analysis service, and
 * renders the resulting 3D tumor mesh with an orbit-controlled viewer plus
 * a shape-metrics panel, styled to match the app's existing glassmorphism /
 * dark-neon theme.
 *
 * Requires: `npm install three`
 *
 * Usage:
 *   <CTTumor3DViewer apiBaseUrl="http://localhost:8001" />
 */

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./CTTumor3DViewer.module.css";

const DEFAULT_API_BASE = "http://localhost:8001";

export default function CTTumor3DViewer({ apiBaseUrl = DEFAULT_API_BASE }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const meshGroupRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | uploading | analyzing | ready | error | no-tumor
  const [metrics, setMetrics] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Three.js scene setup (runs once) ---
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c1c1e); // matches app's dark theme

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(150, 100, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // lighting: key + fill + rim, neon-accented to match the fitness dashboard style
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(100, 150, 100);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4fd1ff, 0.4); // blue neon accent
    fillLight.position.set(-100, 50, -50);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambient);

    const grid = new THREE.GridHelper(300, 30, 0x2a2a2e, 0x2a2a2e);
    grid.position.y = -80;
    scene.add(grid);

    sceneRef.current = scene;
    rendererRef.current = { renderer, camera, controls };

    let frameId;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // --- Load a mesh (.glb) into the scene ---
  const loadMesh = useCallback((meshUrl) => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (meshGroupRef.current) {
      scene.remove(meshGroupRef.current);
      meshGroupRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      meshUrl,
      (gltf) => {
        const group = gltf.scene;
        group.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xff4d4d, // neon red — matches "critical" alert accent in Fitness dashboard
              metalness: 0.15,
              roughness: 0.35,
              transparent: true,
              opacity: 0.92,
            });
          }
        });

        // center the mesh at origin
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        group.position.sub(center);

        scene.add(group);
        meshGroupRef.current = group;

        // frame the camera on the mesh
        const size = box.getSize(new THREE.Vector3()).length();
        const { camera, controls } = rendererRef.current;
        camera.position.set(size * 0.8, size * 0.6, size * 0.8);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (err) => {
        console.error("Failed to load mesh:", err);
        setStatus("error");
        setErrorMsg("Could not load the 3D tumor mesh.");
      }
    );
  }, []);

  // --- Upload + analyze handler ---
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");
    setMetrics(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("analyzing");
      const res = await fetch(`${apiBaseUrl}/api/vnet/analyze-ct`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error (${res.status})`);
      }

      const data = await res.json();

      if (!data.tumor_detected) {
        setStatus("no-tumor");
        return;
      }

      loadMesh(`${apiBaseUrl}${data.mesh_url}`);
      setMetrics(data.metrics);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Analysis failed.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>3D Tumor Modelling — V-Net Segmentation</h3>
        <label className={styles.uploadButton}>
          {status === "uploading" || status === "analyzing" ? "Processing…" : "Upload CT Scan (.nii.gz)"}
          <input
            type="file"
            accept=".nii,.nii.gz"
            onChange={handleFileUpload}
            disabled={status === "uploading" || status === "analyzing"}
            hidden
          />
        </label>
      </div>

      <div className={styles.viewerLayout}>
        <div ref={mountRef} className={styles.viewerCanvas} />

        <div className={styles.metricsPanel}>
          {status === "idle" && (
            <p className={styles.helperText}>Upload a CT volume to generate a 3D tumor model and shape analysis.</p>
          )}
          {(status === "uploading" || status === "analyzing") && (
            <p className={styles.helperText}>
              {status === "uploading" ? "Uploading scan…" : "Running V-Net segmentation & mesh reconstruction…"}
            </p>
          )}
          {status === "no-tumor" && <p className={styles.helperText}>No tumor region detected above threshold.</p>}
          {status === "error" && <p className={styles.errorText}>{errorMsg}</p>}

          {status === "ready" && metrics && (
            <>
              <MetricRow label="Volume" value={`${metrics.volume_cm3} cm³`} />
              <MetricRow label="Surface Area" value={`${metrics.surface_area_cm2} cm²`} />
              <MetricRow label="Max Diameter" value={`${metrics.max_diameter_mm} mm`} />
              <MetricRow label="Sphericity" value={metrics.sphericity} />
              <MetricRow label="Convexity" value={metrics.convexity} />
              <MetricRow label="Elongation" value={metrics.elongation} />
              <MetricRow label="Flatness" value={metrics.flatness} />
              <MetricRow label="Model Confidence" value={`${(metrics.mean_confidence * 100).toFixed(1)}%`} highlight />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, highlight = false }) {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={highlight ? styles.metricValueHighlight : styles.metricValue}>{value}</span>
    </div>
  );
}
