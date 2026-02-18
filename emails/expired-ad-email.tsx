import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface ExpiredAdEmailProps {
    adTitle: string;
    manageLink: string;
}

export const ExpiredAdEmail = ({
    adTitle,
    manageLink,
}: ExpiredAdEmailProps) => (
    <Html>
        <Head />
        <Preview>Twoje ogłoszenie "{adTitle}" wygasło</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Ważność twojego ogłoszenia dobiegła końca</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Cześć! Ważność Twojego ogłoszenia <strong>"{adTitle}"</strong> właśnie się zakończyła i nie jest ono już widoczne w serwisie.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#fff7ed', borderRadius: '8px', textAlign: 'center', border: '1px solid #fed7aa' }}>
                    <Text style={{ margin: '0 0 15px', color: '#9a3412' }}>Kliknij poniżej, aby przedłużyć ogłoszenie:</Text>
                    <Button
                        href={manageLink}
                        style={{ backgroundColor: '#ea580c', color: '#fff', padding: '12px 24px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        Przedłuż Ogłoszenie
                    </Button>
                    <Text style={{ fontSize: '12px', color: '#9a3412', marginTop: '15px' }}>
                        Ogłoszenie pozostanie w archiwum, dopóki go nie aktywujesz.
                    </Text>
                </Section>

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
                    Lekcjo - Dziękujemy że jesteś z nami!
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ExpiredAdEmail;
