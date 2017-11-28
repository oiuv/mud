#include <ansi.h>
inherit BOOK;

string* titles = ({
        YEL "「子张心得」" NOR,
        YEL "「子路心得」" NOR,
        YEL "「子贡心得」" NOR,
        YEL "「子夏心得」" NOR,

});

void create()
{
        string name;
        name = titles[random(sizeof(titles))];

        set_name(name, ({ "literate book5", "literate", "book5" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", YEL "这是一册古书，封皮上写着心得学说四个字。\n");
                set("value", 2500);
                set("no_sell", "这…这值什么钱？\n");
                set("material", "paper");
                set("skill", ([
                	"name" : "literate",
                	"jing_cost"  : 60,
                	"difficulty" : 60,
                	"max_skill"  : 199,
                	"min_skill"  : 150,
                ]) );
        }
        setup();
        move("/d/gaochang/mishi2");
}
