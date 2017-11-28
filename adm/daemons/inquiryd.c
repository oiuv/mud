#include <ansi.h>

int parse_inquiry(object me, object ob, string topic)
{
	switch (topic)
        {
	case "name":
		message_vision(CYN "$N" CYN "向$n" CYN "问道：敢问" +
                               RANK_D->query_respect(ob) + "尊姓大"
                               "名？\n" NOR, me, ob);
		return 1;

	case "here":
		message_vision(CYN "$N" CYN "向$n" CYN "问道：这位" +
                               RANK_D->query_respect(ob) + "，" +
                               RANK_D->query_self(me) + "初到贵宝地"
                               "，不知这里有些什麽风土人情？\n" NOR,
                               me, ob);
		return 1;

	case "clue":
	case "线索":
		message_vision(CYN "$N" CYN "向$n" CYN "打听道：" +
                               RANK_D->query_self(me) + "从旁人处得"
                               "知" + RANK_D->query_respect(ob) +
                               "有些线索，能否告知在下？\n" NOR, me, ob);
		return 1;

	case "rumor":
	case "rumors":
        case "消息":
		message_vision(CYN "$N" CYN "向$n" CYN "问道：这位" +
			       RANK_D->query_respect(ob) + "，不知"
                               "最近有没有听说什么消息？\n" NOR, me,
                               ob);
		return 1;

	default:
		return 0;
	}
}
