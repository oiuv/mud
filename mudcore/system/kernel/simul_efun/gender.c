/*****************************************************************************
Copyright: 2019, Mud.Ren
File name: gender.c
Description: 角色性别人称相关模拟函数
Author: xuefeng
Version: v1.0
Date: 2019-03-12
History:
*****************************************************************************/
string pronoun(int pronoun_number, mixed arg)
{
    if( objectp(arg) )
        arg = arg->query("gender");

    switch(pronoun_number)
    {
        case 1:
            return "我";

        case 2:
            return "你";

        case 3:
            switch( arg )
            {
                case MALE: return "他";
                case FEMALE: return "她";
                default:
                    return "它";
            }
        default:
            error("错误的人称代词。\n");
    }
}
