//Room: bridge2.c

inherit ROOM;

void create ()
{
        set ("short", "金水桥");
        set ("long", @LONG
金水桥是一条直通皇宫的大石桥，宽敞可容四马并驰，建造得鬼斧
神功，气势磅礴，使人生起一夫当关万夫莫敌的感觉。桥下有一条清澈
见底、蜿蜒地川流的小河，河水有时撞在石上，发出淙淙的流水声，悦
耳动听。桥北通向故皇宫，南面是青龙街。
LONG);
        set("exits", 
        ([ //sizeof() == 2
		"south" : __DIR__"qinglong2",
        	"north" : __DIR__"huanggong",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/yulinjun" : 2,
        	__DIR__"npc/tongling2" : 1,
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
