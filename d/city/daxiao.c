#include <ansi.h>
inherit ROOM;

int sos(int,int);
void fresh(object ob);

void create()
{
        set("short", "赌场");
        set("long", @LONG
这里是赌大小的房间，四周的赌房里传出来吆五喝六的赌
博声。这个赌场规模虽算不上很大，但赌的种类却很齐全，服
务也非常周到。这里的墙上挂着一块牌子(paizi)。
LONG);
        set("item_desc", ([
                "paizi" : WHT "\n\n        ※※※※※※※※※※※※※※※\n"
                              "        ※                          ※\n"
                              "        ※         " NOR + HIW "赌博规则" NOR + WHT "         ※\n"
                              "        ※                          ※\n"
                              "        ※      用三粒色子撒在一只  ※\n"
                              "        ※  碗里，色子点数总和在四  ※\n"
                              "        ※  至十间为小，十一至十七  ※\n"
                              "        ※  为大。如三粒色子点数相  ※\n"
                              "        ※  同，则大小通吃。开大赔  ※\n"
                              "        ※  大开小赔小，赔率一。接  ※\n"
                              "        ※  受各种货币为赌注。限额  ※\n"
                              "        ※  为五十到五百。          ※\n"
                              "        ※                          ※\n"
                              "        ※  " NOR + HIW "开赌" NOR + WHT "：                  ※\n"
                              "        ※                          ※\n"
                              "        ※          " NOR + HIY "big" NOR + WHT "             ※\n"
                              "        ※   " NOR + HIY "gamble" NOR + HIW "  |" NOR + HIY "  数量  货币" NOR + WHT "  ※\n"
                              "        ※         " NOR + HIY "small" NOR + WHT "            ※\n"
                              "        ※                          ※\n"
                              "        ※                          ※\n"
                              "        ※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
        set("exits", ([
                "east" : __DIR__"duchang",
        ]));
        set("objects", ([
                "/d/beijing/npc/duke" : 2,
                "/d/changan/npc/zhuangjia" : 1,
        ]));
        set("no_fight", 1);
        setup();
}

void init()
{
        add_action("do_gamble", "gamble");
}

int do_gamble(string arg)
{
        int a,b,c;
        int wager/*, skill, lpoint, tpoint*/;
        string wtype1, wtype2, status;
        object mtype, me;
//      mapping lrn;

        int min, max;
        min = 50;
        max = 500000;

        me = this_player();

        if (me->query_temp("casino/mark"))
                return notify_fail(CYN "赌客叫道：干嘛？干嘛？现在还没轮到你呢。\n" NOR);

        if (! arg || sscanf(arg, "%s %d %s", wtype1, wager, wtype2) != 3)
                return notify_fail(CYN "赌客讥笑道：哪里有你那样赌钱的？\n" NOR);

        mtype = present(wtype2 + "_money", me);

        if (! mtype)
		return notify_fail("你身上没有这种货币。\n");

        if (wager < 1)
		return notify_fail("你要压多少啊？\n");

        if ((int)mtype->query_amount() < wager)
                return notify_fail("你身上没有那么多" + mtype->query("name") + "。\n");

        if (wager > 50)
		return notify_fail(CYN "庄家皱眉道：怎么那么多零零碎碎？去换成整的再来。\n" NOR);

        if (wager * (mtype->query("base_value")) < min
           || wager * (mtype->query("base_value")) > max)
        	return notify_fail("你的赌注不在限额之内。\n");

        if ((wtype1 != "big") && (wtype1 != "small") )
                return notify_fail("你要赌大还是赌小？\n");

        me->set_temp("gamb_t",(me->query_temp("gamb_t") +1));

        if (me->query_temp("gamb_t") > 50)
        {
                call_out("fresh", 300, me);
                me->set_temp("casino/mark", 1);
                return notify_fail(CYN "赌客叫道：这位" + RANK_D->query_respect(me) +
                                   CYN "，你赌了那么久，也该换人了吧？\n" NOR);
        }

        a = random(6) + 1;
        b = random(6) + 1;
        c = random(6) + 1;

        message_vision(HIW "\n庄家喝道：开！" + chinese_number(a) + "、"
                       + chinese_number(b) + "、" + chinese_number(c) +
                       "，", me);

        if ((a == b) && (b == c) )
                message_vision("大小通杀。\n\n" NOR, me);

        else if ((a + b + c) > 10)
                message_vision("吃小赔大。\n\n" NOR, me);

        else if ((a + b + c) < 11)
                message_vision("吃大赔小。\n\n" NOR, me);

        if (((a == b) && (b == c))
           || ((a + b + c) > 10 && (wtype1 == "small"))
           || ((a + b + c) < 11 && (wtype1 == "big")))
                status = "lose";

        if ( status == "lose")
	{
        	message_vision(me->query("name") + "输了" + chinese_number(wager) +
                               mtype->query("base_unit") + mtype->query("name") +
                               "。\n", me);
                mtype->set_amount((int)mtype->query_amount() - wager);
                mtype->move(me, 1);
        } else
	{
       		message_vision(me->query("name") + "赢了" + chinese_number(wager) +
                               mtype->query("base_unit") + mtype->query("name") +
                               "。\n", me);
                mtype->set_amount((int)mtype->query_amount() + wager);
                mtype->move(me, 1);
        }
        return 1;
}

void fresh(object ob)
{
	if (! objectp(ob)) return;
        ob->delete_temp("gamb_t");
        ob->delete_temp("casino/mark");
}

int sos(int lower, int upper)
{
        int x,y;
        x = 0;

        while (lower <= upper)
        {
                y = lower * lower;
                x += y;
                lower++;
        }
        return x;
}