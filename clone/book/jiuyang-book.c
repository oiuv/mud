// jiuyang.c

inherit BOOK;
inherit F_UNIQUE;
 
void create()
{
        set_name("「九阳真经」", ({ "jiuyang zhenjing", "jiuyang", "zhenjing" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
"这是一本薄薄的经书，只因油布包得紧密，虽长期藏在猿腹之中，书页仍然完好无损。
书面上写著几个弯弯曲曲的文字，他一个也不识得，翻开来一看，四本书中尽是这些怪
文，但每一行之间，却以蝇头小楷写满了中国文字。\n",
        );
		set("value", 1);
		set("no_sell", 1);
                set("material", "paper");
                set("skill", ([
                        "name"        : "jiuyang-shengong",
                        "exp_required":  100000,
                        "jing_cost"   :  120,
                        "difficulty"  :  40,
                        "max_skill"   :  180,
                        "min_skill"   :  30,
                ]) );
        }
}

int query_autoload() { return 1; }

