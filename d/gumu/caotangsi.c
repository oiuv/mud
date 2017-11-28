
inherit ROOM;

void create()
{
        set("short", "草堂寺");
        set("long", @LONG
这是一座位於终南山北麓的小寺。寺院中的一口古井，名
为烟雾井。因为每天清晨都会有一股巨大的烟雾，自井里袅袅
升起，不少游客来此，就是为了一观此奇景。往南上是一条崎
岖的山道。往北是一条阴森森的小径。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "southup"     : __DIR__"shanlu7",
        ]));

        setup();
        replace_program(ROOM);
}
