inherit ROOM;

void create ()
{
        set ("short", "长安南城门");
        set ("long", @LONG
长安城的南城门。这里的护城河既深又阔，而且城高墙厚，有一夫
当关，万夫莫开之势，城内还驻扎了两营士兵，远看军营延绵，旌期似
海，颇具慑人之势，仰望城楼，只见城楼高处满布哨兵，剑拔驽张，士
气昂扬，从这里出去不远就是兵家要地武功镇。
LONG);
        set("exits", ([
                "southwest" : "/d/quanzhen/guandao1",
                "north" : __DIR__"nanan-daokou",
        ]));
        set("objects", ([
                __DIR__"npc/wujiang" : 1,
                __DIR__"npc/guanbing": 2,
                "/clone/npc/walker" : 1,
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
