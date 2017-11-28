// yunu.c

inherit ROOM;

void create()
{
        set("short", "玉女峰");
	set("long", @LONG
这里是华山的中峰，玉女峰。传说春秋时隐士萧史善吹洞箫，箫声引
动了秦穆公女儿弄玉的爱慕，抛弃了宫廷生活，跟萧史来此隐居，故称玉
女峰。这里地势略为平缓，不似其它四峰般险峻，江湖上赫赫有名的华山
剑派就在此处。东边有所小小的庙宇，那就是玉女祠了。北面稀稀落落有
十几间房子，是华山派的地方，闲杂游客最好别往那里去。
LONG
        );
        set("exits", ([ /* sizeof() == 3 */
            "westdown"  : __DIR__"zhenyue",
            "west"      : __DIR__"yunuci",
            "north"     : __DIR__"square",
            "southdown" : __DIR__"yunupath1",
            "northeast" : __DIR__"xiaolu1",
       ]));
       set("objects", ([
            __DIR__"npc/yue-lingshan" : 1,
       ]));

//        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
 
