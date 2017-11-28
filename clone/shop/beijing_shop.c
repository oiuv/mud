inherit SHOP;

void create()
{
	set("short", "聚宝堂");
	set("long", @LONG
这里便是北京城里最有名的聚宝堂，铺里人来人往，川流
不息，显出天子之都繁华大方的气派。不过店里的货柜上却空
无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
这里便是北京城里最有名的聚宝堂，铺里人来人往，川流
不息，显出天子之都繁华大方的气派。铺面宽敞明亮，柜上摆
满了各式各样、琳琅满目的货物。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/beijing/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
