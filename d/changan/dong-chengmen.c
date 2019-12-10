//Room: dong-chengmen.c

inherit ROOM;

void create ()
{
        set ("short", "长安东城门");
        set ("long", @LONG
长安城的东城门。这里的护城河既深又阔，而且城高墙厚，有一夫
当关，万夫莫开之势，城内还驻扎了两营士兵，远看军营延绵，旌期似
海，颇具慑人之势，仰望城楼，只见城楼高处满布哨兵，剑拔驽张，士
气昂扬。
LONG);
        set("exits", ([
        	"east"  :  __DIR__"road4",
        	"west" : __DIR__"dongan-daokou",
        ]));
        set("objects", ([
        	__DIR__"npc/wujiang" : 1,
        	__DIR__"npc/guanbing" : 2,
                "/clone/npc/walker" : 1,
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
