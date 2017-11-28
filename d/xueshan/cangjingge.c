inherit ROOM;

string* books = ({
        "/clone/book/mizong_book",
        "/clone/book/book-bamboo",
        "/clone/book/book-silk",
        "/clone/book/book-stone",
        "/clone/book/book-iron",
        "/clone/book/skin-hammer",
});
void create()
{
        set("short", "藏经室");
        set("long", @LONG
这里是大轮寺的藏经室，靠墙是一排书架，摆满了各种拳
谱、书籍。大多是当年掌门人鸠摩智翻译的佛经和从少林寺取
来的武学典籍。
LONG);
        set("exits", ([
                "north" : __DIR__"dating",
        ]));

        set("objects", ([
                books[random(sizeof(books))] : 1,
                books[random(sizeof(books))] : 1,
                books[random(sizeof(books))] : 1,
                CLASS_D("xueshan")+"/daerba" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
