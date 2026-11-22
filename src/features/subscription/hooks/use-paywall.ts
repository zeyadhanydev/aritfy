import { useSubscriptionModal } from "../store/use-subscription-modal";
import { useGetSubscription } from "../api/use-get-subscription";

export const usePaywall = () => {
	const { data: subscription, isLoading: isLoadingSubscription } =
		useGetSubscription();

	const subscriptionModal = useSubscriptionModal();

	const shouldBlock = isLoadingSubscription || !subscription?.active;

	return {
		isLoading: isLoadingSubscription,
        isDemoPremium: subscription?.demoPremium ?? false,
		shouldBlock,
		triggerPaywall: () => {
			subscriptionModal.onOpen();
		},
	};
};
