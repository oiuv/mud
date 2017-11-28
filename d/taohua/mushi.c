inherit ROOM;

void create()
{
  
        set("short", "墓室");
        set("long", @LONG
这是一间宽敞的墓室。墓室顶上有一颗特别大的明珠闪闪
发光。中央放着一副玉棺，周围则堆放了无数的奇珍异玩。有
张供桌摆在玉棺前，桌上放着个盘子。墓室对面挂这幅青年少
妇的画像。画像上的少妇巧笑嫣然，和惨白的玉棺及碧油油的
珠光形成了一幅奇诡的画面。
LONG);
        set("exits", ([
                "up" : __DIR__"mudao",
        ]));

        if (random(1000) > 998)
                set("objects", ([
                        "/clone/money/gold" : 10,
                        "/clone/fam/item/haoyue" : 1,
                        "/clone/fam/etc/lv5b" : 1,
                ]));
	else
        if (random(100) > 98)
                set("objects", ([
                        "/clone/money/gold" : 5,
                        "/clone/fam/etc/lv5a" : 1,
                ]));
	else
        if (random(100) > 97)
                set("objects", ([
                        "/clone/money/gold" : 5,
                        "/clone/fam/etc/lv5d" : 1,
                ]));
	else
        if (random(10) > 8)
                set("objects", ([
                        "/clone/money/gold" : 1,
                ]));

        setup();
}
