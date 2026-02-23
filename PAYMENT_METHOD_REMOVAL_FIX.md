# 결제 수단 제거 기능 수정 완료 ✅

## 문제점
- 활성 구독이 없을 때 결제 수단 제거 시 404 에러 발생
- `cancelSubscription` 함수가 활성 구독이 없으면 `NotFoundException` 발생
- 결제 수단만 제거하고 싶을 때도 구독 취소 로직 호출

## 해결 방법

### 1. 백엔드 수정

#### `subscription.service.ts`
새로운 `removePaymentMethod` 함수 추가:
```typescript
async removePaymentMethod(userId: string) {
  // 활성 구독 확인
  const activeSubscription = await this.prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  });

  // 활성 구독이 있으면 먼저 취소
  if (activeSubscription) {
    await this.prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: 'CANCELLED' },
    });

    // 사용자 멤버십을 FREE로 변경
    await this.prisma.user.update({
      where: { id: userId },
      data: { membership: 'FREE' },
    });
  }

  // 결제 수단 제거
  const paymentMethod = await this.prisma.paymentMethod.findFirst({
    where: { userId },
  });

  if (paymentMethod) {
    await this.prisma.paymentMethod.delete({
      where: { id: paymentMethod.id },
    });
  }

  return { 
    success: true, 
    message: activeSubscription 
      ? '구독이 취소되고 결제 수단이 제거되었습니다.' 
      : '결제 수단이 제거되었습니다.' 
  };
}
```

#### `subscription.controller.ts`
```typescript
@Post('remove-method')
@UseGuards(JwtAuthGuard)
async removePaymentMethod(@Request() req: any) {
  // 결제 수단 제거 (활성 구독이 있으면 자동으로 취소)
  return this.subscriptionService.removePaymentMethod(req.user.sub);
}
```

### 2. 프론트엔드 수정

#### `PaymentMethodCard.tsx`
- API URL 기본값을 `http://localhost:3000/api`로 수정 (3001 → 3000)

## 동작 방식

### 케이스 1: 활성 구독이 있는 경우
1. 구독 상태를 `CANCELLED`로 변경
2. 사용자 멤버십을 `FREE`로 변경
3. 결제 수단 제거
4. 메시지: "구독이 취소되고 결제 수단이 제거되었습니다."

### 케이스 2: 활성 구독이 없는 경우
1. 결제 수단만 제거
2. 메시지: "결제 수단이 제거되었습니다."

### 케이스 3: 결제 수단이 없는 경우
1. 아무 작업도 하지 않음
2. 메시지: "결제 수단이 제거되었습니다."

## 테스트 시나리오

### ✅ 시나리오 1: 구독 중인 사용자
1. PREMIUM 구독 중
2. 결제 수단 제거 클릭
3. 확인 다이얼로그 → "제거" 클릭
4. 구독 취소 + 결제 수단 제거
5. 멤버십 FREE로 변경
6. 성공 메시지 표시

### ✅ 시나리오 2: 결제 수단만 등록한 사용자
1. 결제 수단 등록했지만 구독 안 함
2. 결제 수단 제거 클릭
3. 확인 다이얼로그 → "제거" 클릭
4. 결제 수단만 제거
5. 성공 메시지 표시

### ✅ 시나리오 3: 구독 취소 후 결제 수단 제거
1. 구독 취소 (상태: CANCELLED)
2. 결제 수단 제거 클릭
3. 결제 수단만 제거 (이미 취소된 구독은 건드리지 않음)
4. 성공 메시지 표시

## 변경된 파일
- `backend/src/subscription/subscription.service.ts`
- `backend/src/subscription/subscription.controller.ts`
- `components/subscription/PaymentMethodCard.tsx`

## 배포 전 체크리스트
- [x] 백엔드 빌드 성공
- [x] 로직 검증
- [ ] 프로덕션 배포
- [ ] 실제 사용자 테스트
