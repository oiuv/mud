//Room: huarui2.c

inherit ROOM;

void create ()
{
        set ("short", "华瑞街");
        set ("long", @LONG
华瑞街是长安城南一条东西向的大道，也是长安城的居民区。一条
碎石子铺成的街坊，南边可见一些民居住宅，北面是一家小面馆，街头
有炊烟袅袅飘来青柴的香味。不远处传来家家户户舂米的声音，还有大
户人家榨香油的醇香味。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"minju2",
        	"north" : __DIR__"mianguan",
        	"west" : __DIR__"huarui1",
        	"east" : __DIR__"huarui3",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
