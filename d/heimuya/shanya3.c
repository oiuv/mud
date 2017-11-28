inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "山崖");
        set("long", @LONG
此处入云高耸，已是黑木崖上，两旁站满了日月神教的弟
子。崖边卷着几捆碗口粗的绳索，绳索的一端系有一个供人上
下的吊篮(basket)。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            "north" : __DIR__"shanya2",
        ]));
        set("objects", ([
                __DIR__"npc/dizi2" : 4,
        ]));
        set("item_desc", ([
                "basket" : "一个巨大的吊篮，是供给日月神教中人下山之用。\n"
        ]) );
        setup();
}
  
void init()
{
        add_action("do_enter", "enter");
        add_action("do_float", "float");
        add_action("do_float", "piao");
}

int do_enter(string arg)
{
        object me, myenv;
        me = this_player();

        if (! arg || arg != "basket" )
                return notify_fail("什么？\n");

        if (me->query("family/family_name") != "日月神教")
                return notify_fail(CYN "日月弟子斜瞟了你一眼，冷笑一声，转过头"
                                   "去，对你理也不理。\n" NOR);

        message_vision(HIY "\n$N" HIY "稳稳当当跨进吊篮，向日月弟子打个手势。那"
                       "弟子点了点头，将\n开关一扳，放开绳索，吊篮顿时缓缓向下滑"
                       "去。\n\n", me);
        myenv = environment(me);
        me->move ("/d/heimuya/basket");
        me->start_call_out((: call_other, __FILE__, "down1", me :), 3);
        return 1;
}

void down1(object me)
{
        tell_object(me, HIW "\n你乘座的吊篮急速下降，篮外的朵朵白云向上冲去。\n\n" NOR);
        me->start_call_out((: call_other, __FILE__, "down2", me :), 3);
}

void down2(object me)
{
        tell_object(me, HIG "\n霎时间，一片辽阔的草坪出现在你面前。\n\n" NOR);
        me->move("/d/heimuya/up1");
        message_vision(HIC "\n$N" HIC "乘坐吊篮从黑木崖上滑了下来。\n\n" NOR, me);
}

int do_float()
{
        object me;

        me = this_player();

       // if (me->query_skill("juechen-shenfa", 1) < 180)
        if (me->query_skill("juechen-shenfa", 1) < 120 || me->query_skill("dodge", 1) < 120)
        {
                message_vision("$N朝山崖下望去，沉思良久，叹了口气。\n", me);
                return 1;
        }

        if (me->query("neili") < 100)
        {
                tell_object(me, "你的内力不够，还是休息一下再说吧。\n");
                return 1;
        }

        me->add("neili", -80);

        message_sort(HIC "\n$N" HIC "深深纳入一口气，身形飘然而起，朝山"
                     "崖下落去。\n\n" NOR, me);
        me->move("/d/heimuya/up1");
        tell_object(me, "你飘然落至黑木崖山脚之下。\n");
        message("vision", HIC "\n忽听一声清啸由远及近，" + me->name() +
                          HIC "从上面的山崖飘然落下。\n" NOR,
                          environment(me), ({ me }));
        return 1;
}

