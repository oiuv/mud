//fujiang.c

inherit NPC;

string weapon_file, skill, special_skill;
string *first_name = ({ "赵","钱","孙","李","周","吴","郑","王","樊","陈","祝",
                        "魏","蒋","沈","韩","杨", "刘","张","林","朱","欧阳",
                        "司马","慕容","诸葛" });
string *name_words = ({ "顺","昌","振","发","财","俊","彦","良","志","忠",
        "孝","雄","益","添","金","辉","长","盛","胜","进","安","福","同","满",
        "富","万","龙","隆","祥","栋","国","亿","寿","思","霖","雷","鹏","平",
        "轼","甫","维","龄","桥","溪","声","谷","山","舟","岩","泉","游","逊", });

void determine_data()
{
        switch(random(5))
        {
        case 0:
            weapon_file="changjian";
            skill="sword";
            break;
        case 1:
                weapon_file="gangdao";
            skill="blade";
            break;
        case 2:
                weapon_file="gangzhang";
            skill="staff";
            break;
        case 3:
            weapon_file="changbian";
            skill="whip";
            break;
        case 4:
            weapon_file="axe";
            skill="axe";
            break;
        }
}

void create()
{
        string name;
        name = first_name[random(sizeof(first_name))];
        name += name_words[random(sizeof(name_words))];
        if (random(10) > 2) name += name_words[random(sizeof(name_words))];
    set_name(name, ({"fu jiang","fu","jiang", "general", "fujiang"}));
    set ("long", @LONG
一名战功累累的副将。如今太平了，便练练兵，以防边疆有变。
LONG);
        determine_data();
        set("title", "副将");
        set("gender", "男性");
        set("age", 20 + random(30));
        set("combat_exp", 300000 + random(100000));
        set_skill(skill, 120);
        set_skill("dodge", 120);
        set_skill("parry", 120);
        set_skill("unarmed", 120);
        set_skill("force", 120);
        set("max_qi", 700);
        set("max_jing", 700);
        set("max_neli", 800);
        set("force", 1000);
        set("jiali", 25);

        setup();
        carry_object(__DIR__"obj/" + weapon_file)->wield();
        carry_object(__DIR__"obj/zhanjia")->wear();
}
