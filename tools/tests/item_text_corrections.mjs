// Approved display-only correction. Never rewrite frozen source or observations.
export function correctedItemText(key, value) {
    return key === '"wield_msg"'
        ? value.replaceAll('一股杀气直聂九霄', '一股杀气直慑九霄')
        : value;
}
