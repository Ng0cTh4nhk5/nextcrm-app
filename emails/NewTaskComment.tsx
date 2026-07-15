import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VercelInviteUserEmailProps {
  commentFromUser: string;
  username: string;
  userLanguage: string;
  comment: string;
  taskId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export const NewTaskCommentEmail = ({
  commentFromUser,
  username,
  userLanguage,
  comment,
  taskId,
}: VercelInviteUserEmailProps) => {
  const previewText =
    userLanguage === "vi"
      ? `Bình luận mới về công việc từ hệ thống CBEC`
      : userLanguage === "en"
      ? `New task comment from CBEC app`
      : `Nový komentář k úkolu z aplikace CBEC`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-2xl font-normal text-center p-0 my-[30px] mx-0">
              {userLanguage === "vi"
                ? "Có bình luận mới trên công việc bạn đang theo dõi"
                : userLanguage === "en"
                ? "There is new comment on task you are watching"
                : "Na úkolu, který sledujete, je nový komentář"}
            </Heading>
            <Text className="text-black text-sm leading-[24px]">
              {userLanguage === "vi"
                ? `Xin chào ${username},`
                : userLanguage === "en"
                ? `Hello ${username},`
                : `Dobrý den ${username},`}
            </Text>
            <Text className="text-black text-sm leading-[24px]">
              <strong>{commentFromUser}</strong>
              {userLanguage === "vi"
                ? ` đã để lại bình luận trong Dự án bạn đang theo dõi. `
                : userLanguage === "en"
                ? ` has leave a comment in Project - (Board) you are watching. `
                : ` zanechal(a) komentář v Projektu - (Boardu), který sledujete. `}
            </Text>
            <Text className="text-black text-sm leading-[24px]">
              {userLanguage === "vi" ? `Bình luận: ` : userLanguage === "en" ? `Comment: ` : `Komentář: `}
              <strong>{comment}</strong>
            </Text>
            <Text className="text-black text-sm leading-[24px]">
              {userLanguage === "vi"
                ? `Bạn có thể xem chi tiết tại đây: `
                : userLanguage === "en"
                ? `Details you can find here: `
                : `Podrobnosti najdete zde: `}

              <strong>{`${process.env.NEXT_PUBLIC_APP_URL}/projects/tasks/viewtask/${taskId}`}</strong>
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-slate-800 rounded-md text-white  py-3 px-4 text-xs font-semibold no-underline text-center"
                href={`${process.env.NEXT_PUBLIC_APP_URL}/projects/tasks/viewtask/${taskId}`}
              >
                {userLanguage === "vi" ? "Xem chi tiết" : userLanguage === "en" ? "View task detail" : "Zobrazit úkol"}
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-xs leading-[24px]">
              {userLanguage === "vi"
                ? `Tin nhắn này dành cho - `
                : userLanguage === "en"
                ? `This message was intended for - `
                : `Tato zpráva  byla určeno pro - `}
              <span className="text-black">{username}</span>.
              <span className="text-black"></span>.
              {userLanguage === "vi"
                ? "Nếu bạn không mong đợi tin nhắn này, bạn có thể bỏ qua email. Nếu bạn lo lắng về sự an toàn của tài khoản, vui lòng trả lời email này để liên hệ với chúng tôi."
                : userLanguage === "en"
                ? "If you were not expecting this message, you can ignore this email. If you are concerned about your account&apos;s safety, please reply to this email to get in touch with us."
                : "Pokud jste tuto zprávu neočekávali, můžete tento e-mail ignorovat. Pokud se obáváte o bezpečnost svého účtu, odpovězte na tento e-mail, abyste se s námi spojili."}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewTaskCommentEmail;
