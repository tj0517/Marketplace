import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface PaymentExtendEmailProps {
    adTitle: string;
    newExpiresAt: string;
    manageLink: string;
}

export const PaymentExtendEmail = ({
    adTitle,
    newExpiresAt,
    manageLink,
}: PaymentExtendEmailProps) => (
    <Html>
        <Head />
        <Preview>Płatność potwierdzona - ogłoszenie "{adTitle}" przedłużone!</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Płatność potwierdzona ✅</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Twoje ogłoszenie <strong>"{adTitle}"</strong> zostało przedłużone o 30 dni.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                    <Text style={{ margin: '0 0 10px', color: '#166534', fontWeight: 'bold' }}>
                        Nowa data wygaśnięcia:
                    </Text>
                    <Text style={{ margin: '0', fontSize: '18px', color: '#166534' }}>
                        {new Date(newExpiresAt).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
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

export default PaymentExtendEmail;
