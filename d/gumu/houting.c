#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "后厅");
        set("long", @LONG
这是古墓的后厅，密封得严严实实，没有一丝的缝隙。在
昏暗的灯光下，你发现墙上悬挂着一幅画 (picture)，似乎是
一幅人物的肖像。在厅的中央，摆放着几具棺材(coffin)，其
中只有一具棺材的棺板没有合上，棺材中好象空空如也。
LONG);

        set("exits", ([
                "north" : __DIR__"zhengting",
        ]));
        
        set("objects", ([
                CLASS_D("gumu") + "/longnv" : 1,
                	//杨过从绝情谷转移到古墓与小龙女团聚 by 薪有所属
                CLASS_D("gumu") + "/yang" : 1,
        ]));
        
        set("item_desc", ([
                "picture" : WHT "\n画中是一个中年道士的背影，看不出什么相"
                            "貌，画中人一手指\n天，画角题着「" HIR "活死人"
                            "像" NOR + WHT "」四个大字。\n" NOR,

                "coffin" : WHT "\n用厚厚的石板做成的棺材，棺板合上后，就没"
                           "有一丝的缝隙了。\n" NOR
        ]));

        if (random(10) > 8)
                set("getbook", 3);

        setup();
}

void init()
{
        add_action("do_tang", "tang");
        add_action("do_niu", "niu");
}

int do_tang(string arg)
{
        object ob, paper;
        object me = this_player();

        if (! arg || arg != "coffin")
                return notify_fail("你要躺在哪儿？\n");

        if (me->query_temp("tmarks/棺"))
                return notify_fail("你现在已经躺进棺材了。\n");

        paper = present("paper", me);

        if (query("getbook") >= 1
           && objectp(paper)
           && paper->query("can_draw") >= 1)
        {
                message_sort(HIW "\n$N" HIW "躺进棺材中，把棺板合上，顿时一片"
                             "黑暗，似乎与红尘隔绝了，摸索中$N" HIW "发觉棺板"
                             "内壁题着有字，细细摸来好象一头写着「" HIY "玉女"
                             "心经，技压全真。重阳一生，不输与人" HIW "」十六"
                             "个大字，另一头好象是些图形类的符号。$N" HIW "不"
                             "知所以，正巧身上带有纸张，心想先拓下来再说，于是"
                             "细细地将板上文字全部拓了下来。正在拓字之间，摸到"
                             "棺角上竟似有一块凸起的机关(lock)。\n\n" NOR, me);
                ob = new("/clone/lonely/book/zhenjing3");
                ob->move(me, 1);

                tell_object(me, HIC "你得到了一本" NOR + ob->name() +
                                HIC "。\n\n" NOR);

                add("getbook", -1);
                destruct(paper);
        } else
        if (query("getbook") >= 1)
        {
                message_sort(HIW "\n$N" HIW "躺进棺材中，把棺板合上，顿时一片"
                             "黑暗，似乎与红尘隔绝了，摸索中$N" HIW "发觉棺板"
                             "内壁题着有字，细细摸来好象一头写着「" HIY "玉女"
                             "心经，技压全真。重阳一生，不输与人" HIW "」十六"
                             "个大字，另一头好象是些图形类的符号。$N" HIW "勃"
                             "然心动，可怎奈周围一团漆黑，根本无法看清，只得作"
                             "罢。突然间，摸到棺角上竟似有一块凸起的机关(lock)"
                             "。\n\n" NOR, me);
        } else
        {
                message_sort(HIW "\n$N" HIW "躺进棺材中，把棺板合上，顿时一片"
                             "黑暗，似乎与红尘隔绝了，摸索中$N" HIW "发觉棺板"
                             "内壁题着有字，细细摸来好象一头写着「" HIY "玉女"
                             "心经，技压全真。重阳一生，不输与人" HIW "」十六"
                             "个大字，另一头好象是些图形类符号。不过字迹已被人"
                             "故意刮掉。突然间，摸到棺角上竟似有一块凸起的机关"
                             "(lock)。\n\n", me);
        }

        me->set_temp("tmarks/棺", 1);
        return 1;
}

int do_niu(string arg)
{
        object me = this_player();

        if (! arg || arg != "lock" || ! me->query_temp("tmarks/棺"))
                return notify_fail("你要扭动什么？\n");

        message_sort(HIY "\n$N" HIY "手握机关，轻轻向下扭动，忽然"
                     "间棺底吱吱作响，裂开了一个大洞，$N" HIY "向"
                     "洞中落了下去。\n\n" NOR, me);
        me->move(__DIR__"mishi2");

        me->delete_temp("tmarks/棺");
        return 1;
}
