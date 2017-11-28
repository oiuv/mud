//Room: huarui3.c

inherit ROOM;

void create ()
{
        set ("short", "华瑞街");
        set ("long", @LONG
华瑞街是长安城南一条东西向的大道，也是长安城的居民区。一条
碎石子铺成的街坊，南边可见一些民居住宅，北面是一家花店，街头有
炊烟袅袅飘来青柴的香味。不远处传来家家户户舂米的声音，还有大户
人家榨香油的醇香味。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"minju3",
        	"north" : __DIR__"huadian",
        	"west" : __DIR__"huarui2",
        	"east" : __DIR__"nanan-daokou",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
