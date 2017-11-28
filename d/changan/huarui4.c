//Room: huarui4.c

inherit ROOM;

void create ()
{
        set ("short", "华瑞街");
        set ("long", @LONG
华瑞街是长安城南一条东西向的大道，也是长安城的居民区。一条
碎石子铺成的街坊，南边可见一些民居住宅，北面是小镜湖，街头有炊
烟袅袅飘来青柴的香味。不远处传来家家户户舂米的声音，还有大户人
家榨香油的醇香味。
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"minju4",
        	"north" : __DIR__"xiaojinghu",
        	"west" : __DIR__"nanan-daokou",
        	"east" : __DIR__"huarui5",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
