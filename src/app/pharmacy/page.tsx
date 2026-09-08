import { redirect } from 'next/navigation';

export default function PharmacyRoot() {
  redirect('/pharmacy/orders');
}
