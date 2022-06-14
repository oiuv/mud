#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
    set_name("李自成", ({ "li zicheng", "li", "zicheng"}));
    set("long", "他面透煞气，暴戾异常，看得你心里毛毛的。\n");
    set("gender", "男性");
    set("age", 49);
    set("attitude", "peaceful");
    set("shen_type", -1);
    set("per", 20);

    setup();
    carry_object("/clone/cloth/cloth.c")->wear();
}

void init()
{
    object me = this_player();

    ::init();

    if (! objectp(me) || ! userp(me))
        return;

    command("nod " + me->query("id"));
    command("say 这位" + RANK_D->query_respect(me) + "来得正好，要得"
            "权势，就必须" HIR "心狠手辣" NOR + CYN "不可。" NOR);
    command("say 什么正派人士，全是伪君子，要把他们统统杀光！");

    tell_object(me, HIR "
关于心狠手辣天性的说明：
    天性心狠手辣的玩家能够有效的运用愤怒技能，施展加怒(help baofa)
和愤怒一击，另外在命中对手时还具有更为强大的杀伤力。

    请注意自己要拜师的门派武功对天性是否有要求，在选择前请查看
门派帮助(help)，或在聊天频道求助(chat)。
" NOR);
}

void check_leave(object me, string dir)
{
    if (dir == "out")
    {
        message_vision(CYN "$N" CYN "对$n" CYN "狂笑道：哈哈哈！"
                           "杀光那帮伪君子！\n" NOR,
                       this_object(), me);
        me->set("character", "心狠手辣");
        me->set("startroom", "/d/city/guangchang");
        if (me->query("combat/dietimes") > random(3))
        {
            me->set("special_skill/wrath", 1);
            tell_object(me, HIC "你领悟了特技" + SPECIAL_D("wrath")->name() + "(help special)。\n");
        }
    }
    else if (dir == "south")
    {
        command("sneer");
        command("say 胆小鬼！");
    }
}
