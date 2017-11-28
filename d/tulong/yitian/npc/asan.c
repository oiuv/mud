#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("阿三", ({ "a san", "a", "san" }));
        set("long", "一个五十来岁的男子，上身裸露，右嘴角处\n"
                    "生有一个大痣，双臂肌肉结实无比，一看便\n"
                    "知是外家好手。\n");
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
        
        set("max_qi", 4400);
        set("max_jing", 1400);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 200);
        set("combat_exp", 1600000);

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "finger.fumo" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        set_skill("literate", 100);
        set_skill("buddhism", 150);
        set_skill("sanscrit", 150);
        set_skill("force", 250);
        set_skill("dodge", 250);
        set_skill("unarmed", 250);
        set_skill("parry", 250);
        set_skill("finger", 250);
        set_skill("shaolin-shenfa", 250);
        set_skill("yijinjing", 250);
        set_skill("jingang-zhi", 250);

        map_skill("dodge", "shaolin-shenfa");
        map_skill("force", "yijinjing");
        map_skill("finger", "jingang-zhi");
        map_skill("parry", "jingang-zhi");

        prepare_skill("finger", "jingang-zhi");

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
        command("say 他奶奶的，郡主娘娘面前居然敢动手杀人。");
        return notify_fail("刹那间你只觉得不敢贸然下手。\n");
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

        if (objectp(present("he taichong", environment())))
        return 0;

        if (! me->query_temp("win_he"))
        {
                command("heng");
                command("say 阁下是谁？为何刚才不出战，现在来趁机拣便宜。");
                return notify_fail("看起来阿三并不想跟你较量。\n");
        }

        if (objectp(weapon = me->query_temp("weapon")))
        {
                command("say 我和你比空手，请将" + weapon->name() + "放下。");
                return notify_fail("看起来阿三并不想跟你较量。\n");
        }

        command("grin");
        command("say 好！");
        message_vision(HIY "$N突然大喝一声，手作半爪，食指微曲，向$n" HIY
                           "直扑而来，架势正是少林正宗的大力金刚指！\n" NOR,
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
                message_vision(HIR "\n只听阿三几声惨嚎，全身各处关节竟然已被$n" HIR
                                   "一一用重手折断，大叫一声，瘫倒在地。\n" NOR,
                                   this_object(),query("anti"));

                message_vision(CYN "\n阿三倦缩在地，一张脸痛得全无血色，挣扎着说"
                                   "道：“郡主，小的无能。”，话未说完，已晕了过去。\n" NOR,
                                   this_object());

                message_vision(CYN "赵敏看了倒在地上的阿三一眼，面无表情地说道："
                                   "“来人，给我抬下去。”\n" NOR,
                                   this_object());

                message_vision(CYN "赵敏转过头对$n" CYN
                                   "微笑道：“不错呀，现在让阿二和你比。”\n" NOR,
                                   this_object(),query("anti"));

                query("anti")->set_temp("win_asan",1);
                query("anti")->delete_temp("bi");
                query("anti")->delete_temp("win_he");
                destruct(this_object());
        }
}


