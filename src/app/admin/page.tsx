import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Beheer"
                subtitle={`Welkom terug, ${session.user.name}!`}
            />

            <div className="admin-grid">
                <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>Klassen</h3>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Beheer de klasgroepen</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>Leerkrachten</h3>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Beheer leerkracht accounts</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>Thema's</h3>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Beheer muziekthema's</p>
                </div>
            </div>
        </div>
    );
}
