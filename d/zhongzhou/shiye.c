inherit ROOM;

void create()
{
        set("short", "师爷处");
        set("long", @LONG
一走进师爷的屋子，就见师爷的桌子上零星的散落着一些
糖和瓜果。北面的大墙上贴着一张大的告示，师爷悠闲的坐在
太师椅上。
LONG);
        set("exits", ([
                "south" : __DIR__"zoulang1",                 
        ]));

	setup();
}

