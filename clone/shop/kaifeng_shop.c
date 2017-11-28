inherit SHOP;

void create()
{
	set("short", "万景庄");
	set("long", @LONG
这里是开封城内有名的店铺万景庄，开封为百年古都，民
众富饶。店铺内装饰得非常豪华，不过柜上却空无一物。伙计
在一旁打着盹，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
这里是开封城内有名的店铺万景庄，店堂里人来人往，川
流不息。开封为百年古都，出售的物品也是别具一格。铺面宽
敞明亮，柜上摆满了各式各样、琳琅满目的货物。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/kaifeng/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
