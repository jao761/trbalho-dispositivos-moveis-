import uuid
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from backend.database.business.connection import SessionLocal as BusinessSession
from backend.database.commerce.connection import SessionLocal as CommerceSession
from backend.database.business.models import Company, User, CompanyUser, Client, Quote, QuoteItem, AuditLog
from backend.database.commerce.models import Order, OrderItem, Payment, PaymentEvent
from backend.shared.security.passwords import hash_password
from backend.shared.utils.date_utils import utc_now


def run_seed():
    print("🌱 Iniciando inserção de seeds...")

    b_db: Session = BusinessSession()
    c_db: Session = CommerceSession()

    try:
        # 1. Limpar registros anteriores se existirem (para idempotência)
        b_db.query(AuditLog).delete()
        b_db.query(QuoteItem).delete()
        b_db.query(Quote).delete()
        b_db.query(Client).delete()
        b_db.query(CompanyUser).delete()
        b_db.query(User).delete()
        b_db.query(Company).delete()
        b_db.commit()

        c_db.query(PaymentEvent).delete()
        c_db.query(Payment).delete()
        c_db.query(OrderItem).delete()
        c_db.query(Order).delete()
        c_db.commit()

        # 2. Criar Empresa Principal A (Ferragens Silva)
        company_a_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        company_a = Company(
            id=company_a_id,
            name="Ferragens Silva",
            cnpj="12.345.678/0001-90",
            email="contato@ferragenssilva.com.br",
            phone="(11) 3322-4455",
            address="Av. Industrial, 1500, São Paulo - SP",
            created_at=utc_now() - timedelta(days=60),
            updated_at=utc_now(),
        )
        b_db.add(company_a)

        # 3. Criar Usuário Principal (João da Silva)
        user_a_id = uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        user_a = User(
            id=user_a_id,
            name="João da Silva",
            email="joao@ferragenssilva.com.br",
            password_hash=hash_password("123456"),
            created_at=utc_now() - timedelta(days=60),
            updated_at=utc_now(),
        )
        b_db.add(user_a)

        # Vincular João da Silva a Ferragens Silva como ADMIN
        cu_a = CompanyUser(
            id=uuid.uuid4(),
            company_id=company_a_id,
            user_id=user_a_id,
            role="ADMIN",
            created_at=utc_now() - timedelta(days=60),
        )
        b_db.add(cu_a)

        # 4. Criar Empresa Secundária B (Para testes estritos de isolamento multiempresa)
        company_b_id = uuid.UUID("22222222-2222-2222-2222-222222222222")
        company_b = Company(
            id=company_b_id,
            name="Construtora Souza",
            cnpj="98.765.432/0001-99",
            email="contato@construtorasouza.com.br",
            phone="(21) 2233-4455",
            address="Rua do Aço, 50, Rio de Janeiro - RJ",
            created_at=utc_now() - timedelta(days=30),
            updated_at=utc_now(),
        )
        b_db.add(company_b)

        user_b_id = uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
        user_b = User(
            id=user_b_id,
            name="Maria Souza",
            email="maria@construtorasouza.com.br",
            password_hash=hash_password("123456"),
            created_at=utc_now() - timedelta(days=30),
            updated_at=utc_now(),
        )
        b_db.add(user_b)

        cu_b = CompanyUser(
            id=uuid.uuid4(),
            company_id=company_b_id,
            user_id=user_b_id,
            role="ADMIN",
            created_at=utc_now() - timedelta(days=30),
        )
        b_db.add(cu_b)
        b_db.commit()

        # 5. Criar Clientes para Ferragens Silva
        client_1_id = uuid.UUID("01111111-1111-1111-1111-111111111111")
        client_1 = Client(
            id=client_1_id,
            company_id=company_a_id,
            name="João da Silva",
            email="joao@email.com",
            phone="(11) 99999-9999",
            cpf_cnpj="123.456.789-00",
            address="Rua das Flores",
            number="120",
            complement="",
            city="São Paulo",
            state="SP",
            created_at=utc_now() - timedelta(days=45),
            updated_at=utc_now(),
        )

        client_2_id = uuid.UUID("02222222-2222-2222-2222-222222222222")
        client_2 = Client(
            id=client_2_id,
            company_id=company_a_id,
            name="Construtora Horizonte",
            email="compras@horizonte.com.br",
            phone="(11) 98888-1111",
            cpf_cnpj="12.345.678/0001-90",
            address="Av. Central",
            number="450",
            complement="Bloco B",
            city="São Paulo",
            state="SP",
            created_at=utc_now() - timedelta(days=40),
            updated_at=utc_now(),
        )

        client_3_id = uuid.UUID("03333333-3333-3333-3333-333333333333")
        client_3 = Client(
            id=client_3_id,
            company_id=company_a_id,
            name="Marina Oliveira",
            email="marina.oliveira@email.com",
            phone="(11) 97777-2222",
            cpf_cnpj="987.654.321-00",
            address="Rua do Comércio",
            number="45",
            complement="Apto 12",
            city="Santo André",
            state="SP",
            created_at=utc_now() - timedelta(days=35),
            updated_at=utc_now(),
        )

        client_4_id = uuid.UUID("04444444-4444-4444-4444-444444444444")
        client_4 = Client(
            id=client_4_id,
            company_id=company_a_id,
            name="Oficina Mecânica Norte",
            email="contato@oficinanorte.com.br",
            phone="(11) 96666-3333",
            cpf_cnpj="98.765.432/0001-10",
            address="Estrada Norte",
            number="789",
            complement="Galpão",
            city="Guarulhos",
            state="SP",
            created_at=utc_now() - timedelta(days=30),
            updated_at=utc_now(),
        )

        # Cliente exclusivo da Empresa B (para teste multi-tenant)
        client_b_id = uuid.UUID("09999999-9999-9999-9999-999999999999")
        client_b_exclusive = Client(
            id=client_b_id,
            company_id=company_b_id,
            name="Cliente Exclusivo da Empresa B",
            email="cliente.b@confidencial.com",
            phone="(21) 99888-7777",
            cpf_cnpj="11.222.333/0001-44",
            address="Av. das Américas",
            number="1000",
            city="Rio de Janeiro",
            state="RJ",
            created_at=utc_now(),
            updated_at=utc_now(),
        )

        b_db.add_all([client_1, client_2, client_3, client_4, client_b_exclusive])
        b_db.commit()

        # 6. Criar Orçamentos da Empresa A
        # Orçamento 1 (APROVADO - R$ 119,80) -> vai gerar Pedido 1
        quote_1_id = uuid.UUID("10000000-0000-0000-0000-000000000001")
        quote_1 = Quote(
            id=quote_1_id,
            company_id=company_a_id,
            client_id=client_1_id,
            created_by_user_id=user_a_id,
            number="000123",
            valid_until=date(2026, 9, 7),
            subtotal=129.80,
            discount=10.00,
            total=119.80,
            status="APPROVED",
            notes="Entrega combinada para o período da manhã.",
            created_at=utc_now() - timedelta(days=22),
            updated_at=utc_now() - timedelta(days=20),
        )
        b_db.add(quote_1)
        b_db.flush()

        qi_1_1 = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote_1_id,
            external_product_id="product-001",
            product_name="Martelo Tramontina",
            quantity=2,
            unit_price=39.90,
            discount=0,
            subtotal=79.80,
        )
        qi_1_2 = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote_1_id,
            external_product_id="product-002",
            product_name="Prego galvanizado 18 x 27",
            quantity=5,
            unit_price=10.00,
            discount=0,
            subtotal=50.00,
        )
        b_db.add_all([qi_1_1, qi_1_2])

        # Orçamento 2 (APROVADO - R$ 4680,00) -> vai gerar Pedido 2
        quote_2_id = uuid.UUID("10000000-0000-0000-0000-000000000002")
        quote_2 = Quote(
            id=quote_2_id,
            company_id=company_a_id,
            client_id=client_2_id,
            created_by_user_id=user_a_id,
            number="000124",
            valid_until=date(2026, 9, 9),
            subtotal=4680.00,
            discount=0,
            total=4680.00,
            status="APPROVED",
            notes="Valores válidos enquanto houver estoque.",
            created_at=utc_now() - timedelta(days=20),
            updated_at=utc_now() - timedelta(days=12),
        )
        b_db.add(quote_2)
        b_db.flush()

        qi_2 = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote_2_id,
            external_product_id="product-003",
            product_name="Serrote profissional",
            quantity=58.5,
            unit_price=80.00,
            discount=0,
            subtotal=4680.00,
        )
        b_db.add(qi_2)

        # Orçamento 3 (APROVADO - R$ 890,00) -> vai gerar Pedido 3
        quote_3_id = uuid.UUID("10000000-0000-0000-0000-000000000003")
        quote_3 = Quote(
            id=quote_3_id,
            company_id=company_a_id,
            client_id=client_3_id,
            created_by_user_id=user_a_id,
            number="000125",
            valid_until=date(2026, 9, 11),
            subtotal=890.00,
            discount=0,
            total=890.00,
            status="APPROVED",
            notes="Entrega rápida.",
            created_at=utc_now() - timedelta(days=5),
            updated_at=utc_now() - timedelta(days=4),
        )
        b_db.add(quote_3)
        b_db.flush()

        qi_3 = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote_3_id,
            external_product_id="product-004",
            product_name="Trena 5 metros",
            quantity=29.76,
            unit_price=29.90,
            discount=0,
            subtotal=890.00,
        )
        b_db.add(qi_3)

        # Orçamento 4 (ENVIADO - ainda não é pedido)
        quote_4_id = uuid.UUID("10000000-0000-0000-0000-000000000004")
        quote_4 = Quote(
            id=quote_4_id,
            company_id=company_a_id,
            client_id=client_4_id,
            created_by_user_id=user_a_id,
            number="000126",
            valid_until=date(2026, 9, 20),
            subtotal=500.00,
            discount=0,
            total=500.00,
            status="SENT",
            notes="Aguardando retorno do cliente.",
            created_at=utc_now() - timedelta(days=2),
            updated_at=utc_now() - timedelta(days=2),
        )
        b_db.add(quote_4)
        b_db.flush()

        qi_4 = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote_4_id,
            external_product_id="product-001",
            product_name="Martelo Tramontina",
            quantity=10,
            unit_price=39.90,
            discount=0,
            subtotal=399.00,
        )
        b_db.add(qi_4)

        # Orçamento 5 (RASCUNHO)
        quote_5_id = uuid.UUID("10000000-0000-0000-0000-000000000005")
        quote_5 = Quote(
            id=quote_5_id,
            company_id=company_a_id,
            client_id=client_1_id,
            created_by_user_id=user_a_id,
            number="000127",
            valid_until=date(2026, 10, 1),
            subtotal=80.00,
            discount=0,
            total=80.00,
            status="DRAFT",
            notes="Rascunho de proposta.",
            created_at=utc_now() - timedelta(days=1),
            updated_at=utc_now() - timedelta(days=1),
        )
        b_db.add(quote_5)

        # Orçamento 6 (RECUSADO)
        quote_6_id = uuid.UUID("10000000-0000-0000-0000-000000000006")
        quote_6 = Quote(
            id=quote_6_id,
            company_id=company_a_id,
            client_id=client_4_id,
            created_by_user_id=user_a_id,
            number="000121",
            valid_until=date(2026, 9, 4),
            subtotal=159.60,
            discount=20.00,
            total=139.60,
            status="REJECTED",
            notes="Orçamento recusado pelo cliente.",
            created_at=utc_now() - timedelta(days=25),
            updated_at=utc_now() - timedelta(days=24),
        )
        b_db.add(quote_6)

        # Orçamento da Empresa B (para teste de isolamento)
        quote_b_id = uuid.UUID("10000000-0000-0000-0000-000000000099")
        quote_b = Quote(
            id=quote_b_id,
            company_id=company_b_id,
            client_id=client_b_id,
            created_by_user_id=user_b_id,
            number="B-000001",
            valid_until=date(2026, 9, 30),
            subtotal=9999.00,
            discount=0,
            total=9999.00,
            status="APPROVED",
            notes="Orçamento confidencial da Empresa B",
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        b_db.add(quote_b)

        # Audit Logs para Histórico da Empresa A
        log_1 = AuditLog(
            id=uuid.uuid4(),
            company_id=company_a_id,
            user_id=user_a_id,
            action="QUOTE_CREATED",
            entity_type="QUOTE",
            entity_id=str(quote_1_id),
            metadata_={"number": "000123", "client": "João da Silva", "total": 119.80},
            created_at=utc_now() - timedelta(days=22),
        )
        log_2 = AuditLog(
            id=uuid.uuid4(),
            company_id=company_a_id,
            user_id=user_a_id,
            action="QUOTE_APPROVED",
            entity_type="QUOTE",
            entity_id=str(quote_1_id),
            metadata_={"number": "000123", "client": "João da Silva"},
            created_at=utc_now() - timedelta(days=20),
        )
        log_3 = AuditLog(
            id=uuid.uuid4(),
            company_id=company_a_id,
            user_id=user_a_id,
            action="ORDER_CREATED",
            entity_type="ORDER",
            entity_id="00057",
            metadata_={"number": "00057", "total": 119.80},
            created_at=utc_now() - timedelta(days=19),
        )
        b_db.add_all([log_1, log_2, log_3])
        b_db.commit()

        # 7. Criar Pedidos e Pagamentos em commerce_db (TODOS com quotes aprovadas reais)
        # Pedido 1 originado do Orçamento 1 (APROVADO)
        order_1_id = uuid.UUID("20000000-0000-0000-0000-000000000001")
        order_1 = Order(
            id=order_1_id,
            company_id=company_a_id,
            created_by_user_id=user_a_id,
            quote_id=quote_1_id,
            number="00057",
            client_name="João da Silva",
            status="PAID",
            total=119.80,
            created_at=utc_now() - timedelta(days=19),
            updated_at=utc_now() - timedelta(days=18),
        )
        c_db.add(order_1)
        c_db.flush()

        oi_1_1 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_1_id,
            external_product_id="product-001",
            product_name="Martelo Tramontina",
            quantity=2,
            unit_price=39.90,
            subtotal=79.80,
        )
        oi_1_2 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_1_id,
            external_product_id="product-002",
            product_name="Prego galvanizado 18 x 27",
            quantity=5,
            unit_price=10.00,
            subtotal=50.00,
        )
        c_db.add_all([oi_1_1, oi_1_2])

        # Pedido 2 originado do Orçamento 2 (APROVADO)
        order_2_id = uuid.UUID("20000000-0000-0000-0000-000000000002")
        order_2 = Order(
            id=order_2_id,
            company_id=company_a_id,
            created_by_user_id=user_a_id,
            quote_id=quote_2_id,
            number="00058",
            client_name="Construtora Horizonte",
            status="PROCESSING",
            total=4680.00,
            created_at=utc_now() - timedelta(days=10),
            updated_at=utc_now() - timedelta(days=9),
        )
        c_db.add(order_2)
        c_db.flush()

        oi_2_1 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_2_id,
            external_product_id="product-003",
            product_name="Serrote profissional",
            quantity=58.5,
            unit_price=80.00,
            subtotal=4680.00,
        )
        c_db.add(oi_2_1)

        # Pedido 3 originado do Orçamento 3 (APROVADO)
        order_3_id = uuid.UUID("20000000-0000-0000-0000-000000000003")
        order_3 = Order(
            id=order_3_id,
            company_id=company_a_id,
            created_by_user_id=user_a_id,
            quote_id=quote_3_id,
            number="00059",
            client_name="Marina Oliveira",
            status="PAYMENT_PENDING",
            total=890.00,
            created_at=utc_now() - timedelta(days=3),
            updated_at=utc_now() - timedelta(days=3),
        )
        c_db.add(order_3)
        c_db.flush()

        oi_3_1 = OrderItem(
            id=uuid.uuid4(),
            order_id=order_3_id,
            external_product_id="product-004",
            product_name="Trena 5 metros",
            quantity=29.76,
            unit_price=29.90,
            subtotal=890.00,
        )
        c_db.add(oi_3_1)

        # Pedido da Empresa B (para teste de isolamento)
        order_b_id = uuid.UUID("20000000-0000-0000-0000-000000000099")
        order_b = Order(
            id=order_b_id,
            company_id=company_b_id,
            created_by_user_id=user_b_id,
            quote_id=quote_b_id,
            number="B-ORD-001",
            client_name="Cliente Exclusivo da Empresa B",
            status="PENDING",
            total=9999.00,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        c_db.add(order_b)

        # Pagamentos
        payment_1_id = uuid.UUID("30000000-0000-0000-0000-000000000001")
        payment_1 = Payment(
            id=payment_1_id,
            company_id=company_a_id,
            order_id=order_1_id,
            order_number="00057",
            provider="SIMULATED",
            external_payment_id="PAY-SIM-12345",
            amount=119.80,
            currency="BRL",
            status="APPROVED",
            payment_method="PIX",
            created_at=utc_now() - timedelta(days=18),
            updated_at=utc_now() - timedelta(days=18),
        )

        payment_2_id = uuid.UUID("30000000-0000-0000-0000-000000000002")
        payment_2 = Payment(
            id=payment_2_id,
            company_id=company_a_id,
            order_id=order_2_id,
            order_number="00058",
            provider="SIMULATED",
            external_payment_id="PAY-SIM-12346",
            amount=4680.00,
            currency="BRL",
            status="APPROVED",
            payment_method="Boleto Bancário",
            created_at=utc_now() - timedelta(days=9),
            updated_at=utc_now() - timedelta(days=9),
        )

        payment_3_id = uuid.UUID("30000000-0000-0000-0000-000000000003")
        payment_3 = Payment(
            id=payment_3_id,
            company_id=company_a_id,
            order_id=order_3_id,
            order_number="00059",
            provider="SIMULATED",
            external_payment_id="PAY-SIM-12347",
            amount=890.00,
            currency="BRL",
            status="PENDING",
            payment_method="Cartão de Crédito",
            created_at=utc_now() - timedelta(days=3),
            updated_at=utc_now() - timedelta(days=3),
        )

        # Pagamento da Empresa B (para teste de isolamento)
        payment_b_id = uuid.UUID("30000000-0000-0000-0000-000000000099")
        payment_b = Payment(
            id=payment_b_id,
            company_id=company_b_id,
            order_id=order_b_id,
            order_number="B-ORD-001",
            provider="SIMULATED",
            external_payment_id="PAY-SIM-B999",
            amount=9999.00,
            currency="BRL",
            status="PENDING",
            payment_method="PIX",
            created_at=utc_now(),
            updated_at=utc_now(),
        )

        c_db.add_all([payment_1, payment_2, payment_3, payment_b])

        # Evento de Webhook
        pe_1 = PaymentEvent(
            id=uuid.uuid4(),
            payment_id=payment_1_id,
            provider="SIMULATED",
            external_event_id="EVT-SIM-99901",
            event_type="payment.approved",
            payload={"id": "PAY-SIM-12345", "status": "approved", "amount": 119.80},
            received_at=utc_now() - timedelta(days=18),
            processed_at=utc_now() - timedelta(days=18),
        )
        c_db.add(pe_1)
        c_db.commit()

        print("✅ Seeds coerentes inseridos com sucesso em business_db e commerce_db!")

    except Exception as e:
        b_db.rollback()
        c_db.rollback()
        print(f"❌ Erro ao inserir seeds: {e}")
        raise
    finally:
        b_db.close()
        c_db.close()


if __name__ == "__main__":
    run_seed()
