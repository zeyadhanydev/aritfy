import { useGetSubscription } from "../api/use-get-subscription";
import { useSubscriptionModal } from "../store/use-subscription-modal";

export const usePaywall = () => {
	const subscriptionModal = useSubscriptionModal();
	const { data: subscription, isLoading: isLoadingSubscription } =
		useGetSubscription();
	const shouldBlock = isLoadingSubscription || !subscription?.active;
	return {
		isLoading: isLoadingSubscription,
		shouldBlock,
		triggerPaywall: () => {
			subscriptionModal.onOpen();
		},
	};
};
