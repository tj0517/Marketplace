import {
    Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr
} from '@react-email/components';

interface AdInfo {
    id: string;
    title: string;
    management_token: string;
}

interface RecoveryLinkEmailProps {
    ads: AdInfo[];
    baseUrl: string;
}

export const RecoveryLinkEmail = ({
    ads,
    baseUrl,
}: RecoveryLinkEmailProps) => (
    <Html>
        <Head />
        <Preview>Odzyskiwanie linku do Twoich ogłoszeń</Preview>
        <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading style={{ color: '#333', fontSize: '24px' }}>Twoje ogłoszenia</Heading>
                <Text style={{ color: '#555', fontSize: '16px' }}>
                    Poniżej znajdziesz linki do zarządzania Twoimi ogłoszeniami powiązanymi z tym numerem telefonu:
                </Text>

                {ads.map((ad, index) => (
                    <Section key={ad.id} style={{ padding: '15px', backgroundColor: index % 2 === 0 ? '#f8fafc' : '#ffffff', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                        <Text style={{ margin: '0 0 10px', fontWeight: 'bold', color: '#1e293b' }}>
                            {ad.title}
                        </Text>
                        <Button
                            href={`${baseUrl}/offers/manage/${ad.management_token}`}
                            style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            Zarządzaj
                        </Button>
                        <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                            <a href={`${baseUrl}/offers/${ad.id}`} style={{ color: '#6366f1' }}>Zobacz publicznie</a>
                        </Text>
                    </Section>
                ))}

                <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

                <Text style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                    Nie udostępniaj tych linków nikomu! Pozwalają one na edycję i usunięcie ogłoszeń.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default RecoveryLinkEmail;
