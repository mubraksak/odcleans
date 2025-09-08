import { AdditionalServicesManagement } from "@/components/additional-services-management"
import { query } from "@/lib/database"
import { Service } from "@/lib/types"

export default async function AdditionalServicesPage() {
  const result = await query("SELECT id, name, description, is_active as isActive, display_order as displayOrder FROM services WHERE is_active = TRUE ORDER BY name ASC")
  const services = Array.isArray(result) ? result as Service[] : []

  return (
    <div>
      <AdditionalServicesManagement services={services} />
    </div>
  )
}