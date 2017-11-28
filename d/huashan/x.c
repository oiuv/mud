#include <ansi.h>

inherit ROOM;

void create()
{
        object ob;
        set("short", "空室");
        set("exits", ([
                "out"   : __DIR__"s",
        ]));

        set("long", @LONG
这是一间空旷的石室，不远处有个一石凳，你不禁想象这
里曾经像是有人在上面来打坐或者参悟武学至高境界。你
隐约发现前方石壁（bi）上像是刻着什么东西。
LONG);
        set("item_desc", ([
               "bi"  :   HIW "\n\t\t無\n\t\t招\n\t\t胜\n\t\t有\n\t\t招\n\n」" NOR,
        ]));                       
        
        set("no_clean_up", 0);
        ob = find_object("/clone/lonely/book/dugubook");
        if (! ob) ob = load_object("/clone/lonely/book/dugubook");
        setup();
        if (! environment(ob) && random(5) == 1)
        {

                  ob->move(this_object());
        }
        else destruct(ob);

        replace_program(ROOM);
}
