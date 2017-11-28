#include <ansi.h>
inherit NPC;

void create()
{
        set_name("常金鹏", ({ "chang jinpeng", "chang", "jinpeng" }));
        set("long", @LONG
这便是天鹰教朱雀坛的坛主常金鹏。只见他五
十来岁年纪，脸上手上的肌肉凹凹凸凸、盘根
错节，显是武功了得。
LONG);
        set("title", "天鹰教");
        set("nickname", HIR "朱雀坛主" NOR);
        set("attitude", "heroism");
        set("age", 50);
        set("str", 60);
        set("int", 35);
        set("con", 35);
        set("dex", 35);
        
        set("max_qi", 3500);
        set("max_jing", 3500);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 150);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 200);
        set_skill("riyue-xinfa", 200);
        set_skill("dodge", 180);
        set_skill("feiyan-zoubi", 180);
        set_skill("hammer", 180);
        set_skill("pangu-qishi", 180);
        set_skill("parry", 180);
        set_skill("cuff", 180);
        set_skill("zhenyu-quan", 180);
        set_skill("claw", 180);
        set_skill("poyue-zhao", 180);
        set_skill("martial-cognize", 180);
        set_skill("literate", 100);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "riyue-xinfa");
        map_skill("hammer", "pangu-qishi");
        map_skill("parry", "pangu-qishi");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("天鹰教", 2, "坛主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.kai" :),
                (: exert_function, "recover" :),
                CYN "常金鹏喝道：恶贼还不放手？\n" NOR,
                CYN "常金鹏喝道：恶贼不得无礼！\n" NOR,
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object(__DIR__"obj/jiaofu")->wear();
        carry_object(__DIR__"obj/hammer")->wield();
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压"
                           "压的挤满了人，根本看不清楚。\n");
}

void init()
{
        add_action("do_compare", "compare");
        add_action("do_get", "get");
}

int do_get(string arg)
{
        object obj = this_object();
        string what, where;

        if (! arg)
                return 0;

        if (sscanf(arg, "%s from %s", what, where) != 2)
                return 0;

        if (where == "ding")
        {
                message_vision(CYN "$N对$n" CYN "大喝一声：大胆！竟敢打宝"
                               "刀的主意！\n" NOR, obj, this_player());

                message_vision(CYN "$N对$n" CYN "喝道：去死吧。\n" NOR,
                               obj, this_player());
                obj->kill_ob(this_player());
                this_player()->kill_ob(obj);
                return 1;
        }
        return 0;
}

int do_compare()
{
        object obj = this_object();

        message_vision(CYN "$N对$n" CYN "大喝一声：比什么比，去死吧！\n"
                       NOR, obj, this_player());
        obj->kill_ob(this_player());
        this_player()->kill_ob(obj);
        return 1;
}

int accept_fight(object me)
{
        object obj = this_object();
        command("say 他奶奶的，要打架吗？正合老子心意！\n");
        this_player()->kill_ob(obj);
        kill_ob(me);
        return 1;
}

int accept_hit(object me)
{
        object obj = this_object();
        command("say 他奶奶的，要打架吗？正合老子心意！\n");
        this_player()->kill_ob(obj);
        kill_ob(me);
        return 1;
}

int accept_kill(object me)
{
        object obj = this_object();
        command("say 他奶奶的，要打架吗？正合老子心意！\n");
        this_player()->kill_ob(obj);
        kill_ob(me);
        return 1;
}
