inherit SHOP;

void create()
{
	set("short", "翡翠园");
	set("long", @LONG
这里是大理城内有名的店铺翡翠园，大理地处天南，民众
富饶。店铺内装饰得非常豪华，不过货柜上却空无一物。伙计
在一旁打着盹，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
这里是大理城内有名的店铺翡翠园，店堂里人来人往，川
流不息。大理地处天南，出售的物品也是别具一格。铺面宽敞
明亮，柜上摆满了各式各样、琳琅满目的货物。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/dali/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
