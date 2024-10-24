import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

interface StallCardProps {
  stallName: string;
  orderNumbers: string[];
}

export function StallCard({ stallName, orderNumbers }: StallCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{stallName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {orderNumbers.map((number) => (
            <span key={number} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              {number}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}