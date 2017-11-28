inherit ROOM;

void create()
{
        set("short", "客厅");
        set("long", @LONG
这是阿凡提家的客厅。地上铺着波斯地毯，木架上摆这中
原的瓷器。
LONG);
        set("exits", ([ 
            	"west" : __DIR__"house",
        ]));
        set("objects", ([
                __DIR__"npc/afanti": 1
        ]));
        set("outdoors", "xingxiu");

        setup();
        replace_program(ROOM);
}

