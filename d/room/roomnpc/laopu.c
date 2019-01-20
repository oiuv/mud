// laopu.c 扫地老仆

#include "roomnpc.h"

inherit NPC;
inherit F_GUARDER;

void do_wield();
void do_unwield();
int  accept_object(object who, object ob);

void create()
{
	set_name("扫地老仆", ({"lao pu", "saodi laopu"}) );
	set("gender", "男性" );
	set("age", 50 + random(20));
	set("long", "这是一个扫地的老仆人，不过看上去似乎身怀绝技。\n");
	set("attitude", "friendly");

        set("max_qi", 4000);
        set("max_jing", 2000);
        set("max_neili", 4200);
        set("neili", 4200);
        set("jiali", 70);

        set_skill("force", 200);
        set_skill("parry", 200);
        set_skill("dodge", 200);
        set_skill("sword", 200);
        set_skill("cuff",  200);
        set_skill("strike",200);
        set_skill("huashan-xinfa", 200);
        set_skill("feiyan-huixiang", 200);
        set_skill("huashan-jian", 200);
        set_skill("hunyuan-zhang", 200);
        set_skill("poyu-quan", 200);

        map_skill("force", "huashan-xinfa");
        map_skill("parry", "huashan-jian");
        map_skill("sword", "huashan-jian");
        map_skill("dodge", "feiyan-huixiang");
        map_skill("cuff" , "poyu-quan");
        map_skill("strike", "hunyuan-zhang");

        prepare_skill("cuff", "poyu-quan");
        prepare_skill("strike", "hunyuan-zhang");

        set("chat_chance", 30);
        set("chat_msg", ({
                (: do_unwield :),
        }));

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: do_wield :),
        }));

        setup();

        carry_object("/clone/weapon/gangjian");
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        ::init();
        add_action("do_invite", "invite");
        add_action("do_show", "show");
}

void do_unwield()
{
        command("unwield jian");
}

void do_wield()
{
        command("wield jian");
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
                message_vision("$N愁眉苦脸的对$n道：“可不要和我开这"
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
                               "说罢，老人丢下扫把，飘然而去。\n",
                               this_object(), ob);
                destruct(this_object());
                return 0;
        }

        return ::accept_kill(ob);
}