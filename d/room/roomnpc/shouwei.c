#include "roomnpc.h"

inherit CLASS_D("generate") + "/chinese";
inherit F_GUARDER;
inherit F_COAGENT;

int  accept_object(object who, object ob);

void create()
{
        ::create();
        set_name(query("name"), ({ query("id"), "shou wei", "guarder" }));
        NPC_D->init_npc_skill(this_object(), 7 + random(2));
	set("gender", "男性" );
	set("age", 30 + random(30));
	set("long", "这是看护庄园的守卫，看上去似乎身怀绝技。\n");
	set("attitude", "friendly");

        set("max_qi", 4800);
        set("eff_qi", 4800);
        set("qi", 4800);
        set("max_jing", 2400);
        set("eff_jing", 2400);
        set("jing", 2400);
        set("max_neili", 5200);
        set("neili", 5200);
        set("jiali", 100);
}

void init()
{
        ::init();
        add_action("do_invite", "invite");
        add_action("do_show", "show");
}

int accept_object(object who, object ob)
{
//	object obn;

        if (! ob->query("money_id"))
                return 0;

        if (is_owner(who))
        {
                message_vision(name() + "对$N施了一礼。\n", who);
                destruct(ob);
                return 1;
        }
	return 0;
}

int accept_hit(object ob)
{
        if (is_owner(ob))
        {
                message_vision("$N连忙摆摆手，对$n道：“可不要和我开这"
                               "种玩笑！”\n", this_object(), ob);
                return 0;
        }

        return ::accept_hit(ob);
}

int accept_fight(object ob)
{
        if (is_owner(ob))
        {
                message_vision("$N吓了一跳，慌忙对$n道：“小的不敢，小"
                               "的不敢！”\n", this_object(), ob);
                return 0;
        }

        return ::accept_fight(ob);
}

int accept_kill(object ob)
{
        if (is_owner(ob))
        {
                message_vision("$N一声长叹，道：“既然主人不留我了，罢"
                               "罢罢！合则留，不合则去！我走了。”\n"
                               "说罢，$N一扬手，切下一角衣抉，飘然而去。\n",
                               this_object(), ob);
                destruct(this_object());
                return 0;
        }

        return ::accept_kill(ob);
}