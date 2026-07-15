import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";

type ScheduledReportProps = { reportName: string; dateRange: string; userLanguage?: string; };

export default function ScheduledReport({ reportName = "Report", dateRange = "", userLanguage = "en" }: ScheduledReportProps) {
  const isVi = userLanguage === "vi";
  const isEn = userLanguage === "en";

  const previewText = isVi
    ? `Báo cáo định kỳ của bạn: ${reportName}`
    : isEn
    ? `Your scheduled report: ${reportName}`
    : `Váš plánovaný report: ${reportName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <Container>
          <Heading as="h2">{reportName}</Heading>
          {dateRange && <Text style={{ color: "#666" }}>{isVi ? `Khoảng thời gian: ${dateRange}` : isEn ? `Date range: ${dateRange}` : `Časové období: ${dateRange}`}</Text>}
          <Hr />
          <Text>{isVi ? "Báo cáo định kỳ của bạn được đính kèm trong email này." : isEn ? "Your scheduled report is attached to this email." : "Váš plánovaný report je v příloze tohoto e-mailu."}</Text>
          <Text style={{ color: "#999", fontSize: "12px" }}>{isVi ? "Đây là báo cáo tự động từ CBEC." : isEn ? "This is an automated report from CBEC." : "Toto je automatický report z CBEC."}</Text>
        </Container>
      </Body>
    </Html>
  );
}
