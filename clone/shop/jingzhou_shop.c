inherit SHOP;

void create()
{
	set("short", "五华楼");
	set("long", @LONG
五华楼位于荆州城北，来往于此的多是商富大贾。楼内装
潢得非常典雅精致，堪称荆州城内一绝。不过此时店里的货柜
上却空无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
五华楼位于荆州城北，来往于此的多是商富大贾。楼内装
潢得非常典雅精致，堪称荆州城内一绝。店里的伙计正招呼着
前来购物的客人，忙得满头大汗。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/jingzhou/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
