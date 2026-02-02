import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface PaymentBumpEmailProps {
    adTitle: string;
    manageLink: string;
}

export const PaymentBumpEmail = ({
    adTitle,
    manageLink,
}: PaymentBumpEmailProps) => (
    <Html>
        <Head />
        <Preview>Płatność potwierdzona - ogłoszenie "{adTitle}" podbite!</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Płatność potwierdzona 🚀</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Twoje ogłoszenie <strong>"{adTitle}"</strong> zostało podbite i wyświetla się na górze listy.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#eef2ff', borderRadius: '8px', textAlign: 'center' }}>
                    <Text style={{ margin: '0', color: '#4338ca', fontSize: '16px' }}>
                        Twoje ogłoszenie jest teraz widoczne jako pierwsze!
                    </Text>
                </Section>

                <Section style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button
                        href={manageLink}
                        style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        Zarządzaj ogłoszeniem
                    </Button>
                </Section>

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                    Dziękujemy za korzystanie z naszej platformy!
                </Text>
            </Container>
        </Body>
    </Html>
);

export default PaymentBumpEmail;
