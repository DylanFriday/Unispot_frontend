import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'

const WithdrawalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdraw Requests"
        subtitle="Withdrawal management is not available yet."
      />
      <Card>
        <p className="text-sm text-slate-600">
          Withdraw requests will be available soon.
        </p>
      </Card>
    </div>
  )
}

export default WithdrawalsPage
