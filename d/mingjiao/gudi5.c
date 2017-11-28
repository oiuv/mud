#include <ansi.h>;
inherit ROOM;

void create()
{
        set("short", HIW "昆仑仙境" NOR);
        set("long", @LONG
向西走了二里多，只见峭壁上有一道大瀑布冲击而下，料想是
雪融而成，阳光照射下尤如一条大玉龙，极是壮丽。瀑布泄在一座
清澈碧绿的深潭(tan) 之中，潭水却也不见满，当是另有泄水的去
路。
LONG);
        set("outdoors", "mingjiao");
        set("resource/water", 1);
        set("exits", ([
                "east" : __DIR__"gudi3",
        ]));
        set("item_desc", ([
                "tan" : HIC "\n这是瀑布下的一座清澈碧绿的"
                        "深潭。你附身潭边，凝神瞧去，只见"
                        "\n碧绿的水中十馀条大白鱼(fish)来"
                        "回游动。\n" NOR,

               "fish" : HIW "\n生活在深潭中的白鱼，全身白"
                        "鳞，足有一尺多长。鱼在深潭中游来"
                        "\n游去，你见了不竟想去捉(zhuo)一"
                        "条。\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_zhuo", "zhuo");
}

int do_zhuo(string arg)
{
        object me = this_player();
        object ob;

        if ((! arg) || ! ((arg == "fish") || (arg == "大白鱼")))
                return notify_fail("你要干什么？\n");

        if (query("not_fish"))
        {
                message("vission", HIY "潭中的白鱼已经受惊，全"
                                   "部游至潭底，没法再捉了。\n"
                                   NOR, me);
                return 1;
        }

        message_vision(HIW "\n$N" HIW "静静地伏在岸边，见一条"
                       "白鱼游至身前，猛然一掌击落。\n" NOR, me);
 
        if (me->query("combat_exp") < 100000)
        {
                message("vission", HIR "潭中的大白鱼顿时跳起，"
                                   "你忙伸手去抓，虽然碰到了鱼"
                                   "身，却一滑滑脱了。\n\n" NOR, me);
	        set("not_fish", 1);
                return 1;
        }

        ob = new(__DIR__"obj/fish");
        ob->move(me);
        message_vision(HIR "潭中的大白鱼顿时跳起，$N" HIR "连"
                       "忙伸手抓住，一把把它攥在手心。\n\n" NOR, me);
        set("not_fish", 1);
        return 1;
}
