#include "roomnpc.h"

inherit NPC;

int  accept_object(object who, object ob);

void create()
{
	set_name("仆人", ({"pu ren"}) );
	set("gender", "男性" );
	set("age", 20 + random(20));
	set("long", "这是一个仆人，长得忠厚老实。");
	set("attitude", "friendly");

        setup();
}

int accept_object(object who, object ob)
{
	object obn;

        if (! ob->query("money_id"))
                return 0;

        if (is_owner(who))
        {
                message_vision(name() + "对$N施了一礼。\n", who);
                destruct(ob);
                return 1;
        }

        destruct(ob);
        message_vision(name() + "对$N点头哈腰道：“多谢这位" +
                       RANK_D->query_respect(who) + "啦！”\n", who);
	return 1;
}
