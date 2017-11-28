// 该物件用于记录A-F房间开锁状态和随机分配房间参数
// 该文件常驻内存直到系统关闭

inherit ITEM;
#include <ansi.h>

public string openlock(string lock); // 外部调用开锁函数
public void init_data(string arg); // 初始化物件数据
private string get_result(string str1, string str2);

mapping unlock = ([
// 对应房间可开启锁的序列

        "A" : "1345",
        "B" : "236",
        "C" : "1456", 
        "D" : "136", 
        "E" : "256", 
        "F" : "246", 
]);

void create()
{
        set_name("独孤九剑解迷管理物件", ({ "tsr_dugu-jiujian" }) );
        set_weight(1);
        set("no_clean_up", 1);
        
        if (clonep())
                set_default_object(__FILE__);
        else
                init_data("");

        setup();
}

public void init_data(string arg)
{
         string* rn = ({ "A", "B", "C", "D", "E", "F" });
         int ran_num;
         object s;

         // 随机分配房间参数，每次reboot后顺序都不一样
         // 初试化个房间数据，各个房间数据统一交该物件管理，便于统一
         // 增加了解迷的难度
         ran_num = random(6);
         set("number/lockroom1", rn[ran_num]);
 
         rn -= ({ rn[ran_num] });
         ran_num = random(5); 
         set("number/lockroom2", rn[ran_num]);

         rn -= ({ rn[ran_num] });
         ran_num = random(4); 
         set("number/lockroom3", rn[ran_num]);

         rn -= ({ rn[ran_num] });
         ran_num = random(3); 
         set("number/lockroom4", rn[ran_num]);

         rn -= ({ rn[ran_num] });
         ran_num = random(2); 
         set("number/lockroom5", rn[ran_num]);

         rn -= ({ rn[ran_num] });
         set("number/lockroom6", rn[0]);
            
         set("lock/unlocked", 0); // 所有锁是否解开
         set("lock/opened", ""); // 已经打开的锁序列
  
         if (arg == "enter")
         {
                 if (! s = find_object("/d/huashan/s"))
                           s = load_object("/d/huashan/s");

                 tell_room(s, HIG "只听得轰隆隆几声，石门升起将山洞封住了。\n" NOR);
                 s->delete("exits/enter");
         }

         return;

}

// 外部调用此函数传递参数lock为: "A"-"F"    
public string openlock(string lock)
{       
        string opened, str_want_open;
        mixed result;
        int i;
        object s;

        if (! stringp(query("lock/opened")) ||
            query("lock/opened") == "")
        {
              
              set("lock/opened", unlock[lock]);
              return unlock[lock];
        }
        str_want_open = unlock[lock];
        opened = query("lock/opened");
        
        if (! stringp(opened))
              return "erros: opened is not a string.\n";
 
        result = get_result(opened, str_want_open);
        if (sizeof(result) == 6)
        { 
             set("lock/unlocked", 1);
             set("lock/opened", result);
             if (! s = find_object("/d/huashan/s"))
                       s = load_object("/d/huashan/s");

             s->add("exits", ([
                    "enter" : __DIR__"x",
             ]));

             tell_room(s, HIG "只听得轰隆隆几声，石门已陷入地下，露出了山洞的入口。\n" NOR);
             call_out("init_data", 180 + random(10), "enter"); // 二分钟后重新初始化所有数据
             return "UNLOCKED";
        }
        set("lock/opened", result);

        remove_call_out("init_data");

        return query("lock/opened");

}

private string get_result(string str1, string str2)
{
        int n1, n2;
        string temp;

        if (! strcmp(str1, str2))return "";

        temp = "";        

        for (n1 = 0; n1 < sizeof(str1); n1 ++)
        {
                for (n2 = 0; n2 < sizeof(str2); n2++)
                {
                      if (str2[n2..n2] == str1[n1..n1])
                      {
                              temp += str2[n2..n2];
                      }
                }
       }
       if (temp == "")return str1 + str2;

       for (n1 = 0; n1 < sizeof(temp); n1 ++)
       {
                str1 = replace_string(str1, temp[n1..n1], "");
                str2 = replace_string(str2, temp[n1..n1], "");
       }
       return str1 + str2;
}
