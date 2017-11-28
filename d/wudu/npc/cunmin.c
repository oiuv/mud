// cunmin.c
// by star

inherit NPC;
string *first_name = ({"张", "赵", "钱", "孙","李"});
string *name_words = ({"大叔","二伯","大哥","半仙","大傻"});


void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];


        set_name(name,({"cun min"}));
        set("gender", "男性" );
        set("age", 32);
        set("long", "这是个普普通通的乡下人，紫红的脸膛，手上长满了厚厚的老茧。\n");

        set("max_qi", 200);
        set("shen_type", 1);
        set("str", 17);
        set("dex", 20);
        set("con", 18);
        set("int", 19);
        set("combat_exp", 500);
        set_temp("apply/attack", 5);
        set_temp("apply/defense", 15);
        set("attitude", "peaceful");
        setup();
        carry_object("/d/city/obj/cloth")->wear();
}
