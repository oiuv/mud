#include <ansi.h>
inherit NPC;

void greeting(object me);

void create()
{
    set_name("花铁干", ({"hua tiegan", "hua", "tiegan"}));
    set("long", "他一脸来上去大义凛然，却总让感觉有点什么不对。\n");
    set("gender", "男性");
    set("age", 41);
    set("attitude", "peaceful");
    set("shen_type", -1);
    set("per", 24);

    setup();
    carry_object("/clone/cloth/cloth.c")->wear();
}

void init()
{
    object me = this_player();

    ::init();

    if (!objectp(me) || !userp(me))
        return;

    command("grin " + me->query("id"));
    command("say 这位" + RANK_D->query_respect(me) + "，这年头做那"
            "种什么正人君子太吃亏啦。");
    command("say 看看我，看看岳不群老哥，现今世道" HIM "阴险奸诈" NOR + CYN "才是做人的道理！" NOR);

    tell_object(me, HIM "
关于阴险奸诈天性的说明：
    天性阴险奸诈的玩家在普通战斗状态下或是使用一些特殊的进攻性
绝招时，自身的攻击命中率将获得有效的提升，可以更容易击中对手。

    请注意自己要拜师的门派武功对天性是否有要求，在选择前请查看
门派帮助(help)，或在聊天频道求助(chat)。
" NOR);
}

void check_leave(object me, string dir)
{
    if (dir == "out")
    {
        message_vision(CYN "$N" CYN "对$n" CYN "奸笑道：上路吧"
                           "。\n" NOR,
                       this_object(), me);
        me->set("character", "阴险奸诈");
        me->set("startroom", "/d/city/guangchang");
        if (me->query("combat/dietimes") > random(3))
        {
            me->set("special_skill/trick", 1);
            tell_object(me, HIC "你领悟了特技" + SPECIAL_D("trick")->name() + "(help special)。\n");
        }
    }
    else if (dir == "east")
    {
        command("sneer");
        command("say 哼，没眼光！");
    }
}
