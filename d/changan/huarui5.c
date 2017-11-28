//Room: huarui5.c

inherit ROOM;

void create ()
{
        set ("short", "华瑞街");
        set ("long", @LONG
华瑞街是长安城南一条东西向的大道，也是长安城的居民区。一条
碎石子铺成的街坊，南边可见一些民居住宅，街头有炊烟袅袅飘来青柴
的香味。不远处传来家家户户舂米的声音，还有大户人家榨香油的醇香
味。路边三五个小孩正在拍手唱歌玩耍着。　　
LONG);
        set("exits", 
        ([ //sizeof() == 4
		"south" : __DIR__"minju5",
        	"west" : __DIR__"huarui4",
        	"east" : __DIR__"huarui6",
        	"north" : __DIR__"zahuopu",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
