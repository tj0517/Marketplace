import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface ExpiringSoonEmailProps {
    adTitle: string;
    expiresAt: string;
    manageLink: string;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export const ExpiringSoonEmail = ({
    adTitle,
    expiresAt,
    manageLink,
}: ExpiringSoonEmailProps) => (
    <Html>
        <Head />
        <Preview>Twoje ogłoszenie "{adTitle}" wkrótce wygaśnie!</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Twoje ogłoszenie wkrótce wygaśnie!</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Cześć! Chcieliśmy Cię poinformować, że Twoje ogłoszenie <strong>"{adTitle}"</strong> wygaśnie <strong>{formatDate(expiresAt)}</strong>.
                </Text>

                <Section style={{ padding: '20px', backgroundColor: '#fffbeb', borderRadius: '8px', textAlign: 'center', border: '1px solid #fcd34d' }}>
                    <Text style={{ margin: '0 0 15px', color: '#92400e', fontWeight: 'bold', fontSize: '18px' }}>
                        Zostały tylko 3 dni!
                    </Text>
                    <Text style={{ margin: '0 0 15px', color: '#92400e' }}>
                        Przedłuż ogłoszenie, aby nie stracić widoczności w serwisie:
                    </Text>
                    <Button
                        href={manageLink}
                        style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '12px 24px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                        Przedłuż Ogłoszenie
                    </Button>
                    <Text style={{ fontSize: '12px', color: '#92400e', marginTop: '15px' }}>
                        Po wygaśnięciu ogłoszenie przestanie być widoczne dla potencjalnych uczniów.
                    </Text>
                </Section>

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '14px', color: '#888', textAlign: 'center' }}>
                    Lekcjo - Dziękujemy, że jesteś z nami!
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ExpiringSoonEmail;
