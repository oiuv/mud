#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("阿二", ({ "a er", "a", "er" }));
        set("long", "阿二乃阿三的同门师兄，也是西域少林派一\n"
                    "等一的高手，被汝阳王一重金安置于麾下，\n"
                    "非常得汝阳王的赏识。\n");
        set("title", HIR "西域少林派高手" NOR);
        set("gender", "男性");
        set("age", 55);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("per", 30);
        set("str", 60);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 5000);
        set("max_jing", 1400);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 240);
        set("combat_exp", 1800000);

        set("chat_chance_combat", 20);
        set("chat_msg_combat", ({
                (: perform_action, "strike.feng" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        set_skill("literate", 100);
        set_skill("buddhism", 150);
        set_skill("sanscrit", 150);
        set_skill("force", 270);
        set_skill("dodge", 270);
        set_skill("unarmed", 270);
        set_skill("parry", 270);
        set_skill("strike", 270);
        set_skill("shaolin-shenfa", 270);
        set_skill("yijinjing", 270);
        set_skill("banruo-zhang", 270);

        map_skill("dodge", "shaolin-shenfa");
        map_skill("force", "yijinjing");
        map_skill("strike", "banruo-zhang");
        map_skill("parry", "banruo-zhang");

        prepare_skill("strike", "banruo-zhang");

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        add_action("begin","bi");
}

int accept_fight(object who)
{
        command("say 没郡主的吩咐我不会出手。");
        return 0;
}

int accept_hit(object who)
{
        command("say 没郡主的吩咐我不会出手。");
        return 0;
}

int accept_kill(object who)
{
        command("say 没郡主的吩咐我不会出手，杀了我也一样。");
        return notify_fail("刹那间你只觉得下不了手。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见楼上人影晃动，根本看不清楚。\n");
}

int begin()
{
        object weapon;
        object me=this_player();
        object obj=this_object();

        if (objectp(present("a san", environment())))
        return 0;

        if (! me->query_temp("win_asan"))
        {
                command("@@");
                command("say 阁下是谁？为何刚才不出战，现在来趁机拣便宜。");
                return notify_fail("看起来阿二并不想跟你较量。\n");
        }

        if (objectp(weapon = me->query_temp("weapon")))
        {
                command("shake");
                command("say 我也和你比空手，放下你的" + weapon->name() + "再说。");
                return notify_fail("看起来阿二并不想跟你较量。\n");
        }

        command("nod");
        command("say 我出招了。");
        message_vision( HIW "$N双手合十，对着$n" HIW 
                            "微微一揖，双掌平推，掌劲如巨浪般汹涌而出！\n" NOR,
                            obj,this_player());

        me->set_temp("bi",1);
        set("anti",me);
        obj->kill_ob(this_player());
        this_player()->kill_ob(obj);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision( HIR "\n只听一声轰响，阿二前胸被$n" HIR 
                                    "打中，胸骨尽断，口中鲜血狂喷，身子如断了线的风筝\n"
                                    "一样直飞了出去，倒在地上动也不动一下。\n\n" NOR,
                                    this_object(),query("anti"));

                message_vision( CYN "赵敏颇为惊讶，可还是不露声色，只是向亲兵淡淡挥手说"
                                    "道：“抬下去。”\n" NOR,
                                    this_object());

                message_vision( CYN "赵敏又转头对$n" CYN 
                                    "微笑道：“很好，还剩下个阿大，你胜过了他倚天剑你就取走吧。”\n" NOR,
                                    this_object(), query("anti"));

                query("anti")->set_temp("win_aer",1);
                query("anti")->delete_temp("bi");
                query("anti")->delete_temp("win_asan");
                destruct(this_object());
        }
}

